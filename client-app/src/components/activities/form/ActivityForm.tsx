import React, { FormEvent, FunctionComponent, useContext, useState } from "react"
import { Button, Form, Segment } from "semantic-ui-react"
import { Activity } from "../../../models/Activity"
import { v4 as uuid } from "uuid"
import ActivityStore from "../../../stores/ActivityStore"

interface IActivityFormProps {
  initialFormState: Activity | undefined
}

const ActivityForm: FunctionComponent<IActivityFormProps> = ({ initialFormState }) => {
  const { createActivity, editActivity, submitting, cancelEditForm } = useContext(ActivityStore)
  const initializeForm = (): Activity => {
    if (initialFormState) {
      return initialFormState
    }
    return new Activity()
  }

  const [activity, setActivity] = useState<Activity>(initializeForm)

  const handleSubmit = () => {
    if (activity.id.length === 0) {
      const newActivity = { ...activity, id: uuid() }
      createActivity(newActivity)
    } else {
      editActivity(activity)
    }
  }

  const handleInputChange = (event: FormEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.currentTarget
    setActivity({ ...activity, [name]: value })
  }

  return (
    <Segment clearing>
      <Form onSubmit={handleSubmit}>
        <Form.Input placeholder="Title" value={activity.title} name="title" onChange={handleInputChange} />
        <Form.TextArea
          rows={2}
          placeholder="Description"
          value={activity.description}
          name="description"
          onChange={handleInputChange}
        />
        <Form.Input placeholder="Category" value={activity.category} name="category" onChange={handleInputChange} />
        <Form.Input
          type="datetime-local"
          placeholder="Date"
          value={activity.date}
          name="date"
          onChange={handleInputChange}
        />
        <Form.Input placeholder="City" value={activity.city} name="city" onChange={handleInputChange} />
        <Form.Input placeholder="Venue" value={activity.venue} name="venue" onChange={handleInputChange} />
        <Button floated="right" positive type="submit" content="Submit" loading={submitting} />
        <Button floated="right" type="button" content="Cancel" onClick={cancelEditForm} />
      </Form>
    </Segment>
  )
}

export default ActivityForm
