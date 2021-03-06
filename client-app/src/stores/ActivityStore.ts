import { action, computed, observable, runInAction } from "mobx"
import { SyntheticEvent } from "react"
import ActivitiesApi from "../api/ActivitiesApi"
import { Activity } from "../models/Activity"
import { history } from ".."
import { toast } from "react-toastify"
import { RootStore } from "./RootStore"
import { createAttendee, setActivityProps } from "../utilities/common"

export default class ActivityStore {
  public rootStore: RootStore
  constructor(rootStore: RootStore) {
    this.rootStore = rootStore
  }

  @observable
  public activityRegistry = new Map()
  @observable
  public activity: Activity | null = null
  @observable
  public loadingInitial: boolean = false
  @observable
  public submitting: boolean = false
  @observable
  public target = ""
  @observable
  public loading: boolean = false

  @computed
  public get activitiesByDate(): [string, Activity[]][] {
    return this.groupActivitiesByDate(Array.from(this.activityRegistry.values()))
  }

  private groupActivitiesByDate(activities: Activity[]) {
    const sortedActivities = activities.sort((a, b) => a.date.getTime() - b.date.getTime())
    return Object.entries(
      sortedActivities.reduce((activities, activity) => {
        const date = activity.date.toISOString().split("T")[0]
        activities[date] = activities[date] ? [...activities[date], activity] : [activity]
        return activities
      }, {} as { [key: string]: Activity[] })
    )
  }

  @action
  public loadActivities = async () => {
    this.loadingInitial = true
    try {
      const activities = await ActivitiesApi.getActivityList()
      runInAction("loading activities", () => {
        activities.forEach((activity) => {
          setActivityProps(activity, this.rootStore.userStore.user!)
          this.activityRegistry.set(activity.id, activity)
        })
      })
    } catch (error) {
      runInAction("load activities error", () => {
        console.log(error.response)
      })
    } finally {
      runInAction("finished loading activities", () => {
        this.loadingInitial = false
      })
    }
  }

  @action
  public loadActivity = async (id: string): Promise<Activity> => {
    let activity = this.getActivity(id)
    if (activity) {
      this.activity = activity
      return activity
    } else {
      this.loadingInitial = true
      try {
        activity = await ActivitiesApi.getActivityDetails(id)
        runInAction("getting activity", () => {
          setActivityProps(activity, this.rootStore.userStore.user!)
          this.activity = activity
          this.activityRegistry.set(activity.id, activity)
        })
      } catch (error) {
        runInAction("get activity error", () => {})
        console.log(error.response)
      } finally {
        runInAction("finished loading activity", () => {
          this.loadingInitial = false
        })
        return activity
      }
    }
  }

  @action
  public clearActivity = () => {
    this.activity = null
  }

  private getActivity = (id: string): Activity => {
    return this.activityRegistry.get(id)
  }

  @action
  public createActivity = async (activity: Activity) => {
    this.submitting = true
    try {
      await ActivitiesApi.createActivity(activity)
      const attendee = createAttendee(this.rootStore.userStore.user!)
      attendee.isHost = true
      let attendees = []
      attendees.push(attendee)
      activity.attendees = attendees
      activity.isHost = true
      runInAction("creating activity", () => {
        this.activityRegistry.set(activity.id, activity)
      })
      history.push(`/activities/${activity.id}`)
    } catch (error) {
      runInAction("create activity error", () => {
        console.log(error.response)
      })
      toast.error("Problem submitting data")
    } finally {
      runInAction("finished loading create activity", () => {
        this.submitting = false
      })
    }
  }

  @action
  public editActivity = async (activity: Activity) => {
    this.submitting = true
    try {
      await ActivitiesApi.updateActivity(activity)
      runInAction("editing an activity", () => {
        this.activityRegistry.set(activity.id, activity)
        this.activity = activity
      })
      history.push(`/activities/${activity.id}`)
    } catch (error) {
      runInAction("edit activity error", () => {
        console.log(error.response)
      })
    } finally {
      runInAction("finished loading activity", () => {
        this.submitting = false
      })
    }
  }

  @action
  public deleteActivity = async (event: SyntheticEvent<HTMLButtonElement>, id: string) => {
    this.submitting = true
    this.target = event.currentTarget.name
    try {
      await ActivitiesApi.deleteActivity(id)
      runInAction("deleting activity", () => {
        this.activityRegistry.delete(id)
      })
    } catch (error) {
      runInAction("delete activity error", () => {
        console.log(error)
      })
    } finally {
      runInAction("finished submitting delete method", () => {
        this.submitting = false
        this.target = ""
      })
    }
  }

  @action
  public attendActivity = async () => {
    const attendee = createAttendee(this.rootStore.userStore.user!)
    this.loading = true
    try {
      await ActivitiesApi.attendActivity(this.activity!.id)
      runInAction(() => {
        if (this.activity) {
          this.activity.attendees.push(attendee)
          this.activity.isGoing = true
          this.activityRegistry.set(this.activity.id, this.activity)
        }
      })
    } catch (error) {
      toast.error("Problem signing up to activity")
    } finally {
      runInAction(() => {
        this.loading = false
      })
    }
  }

  @action
  public cancelAttendance = async () => {
    this.loading = true
    try {
      await ActivitiesApi.unattendActivity(this.activity!.id)
      runInAction(() => {
        if (this.activity) {
          this.activity.attendees = this.activity.attendees.filter(
            (x) => x.username !== this.rootStore.userStore.user!.username
          )
          this.activity.isGoing = false
          this.activityRegistry.set(this.activity.id, this.activity)
        }
      })
    } catch (error) {
      toast.error("Problem canceling attendance")
    } finally {
      runInAction(() => {
        this.loading = false
      })
    }
  }
}
