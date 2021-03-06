import React, { FunctionComponent } from "react"
import { List, Image, Popup } from "semantic-ui-react"
import { IAttendee } from "../../../models/Attendee"

interface IActivityListItemAttendeesProps {
  attendees: IAttendee[]
}

const ActivityListItemAttendees: FunctionComponent<IActivityListItemAttendeesProps> = ({ attendees }) => {
  return (
    <List horizontal>
      {attendees.map((attendee) => (
        <List.Item key={attendee.username}>
          <Popup
            header={attendee.displayName}
            trigger={<Image size="mini" circular src={attendee.image || "/assets/user.png"} />}
          />
        </List.Item>
      ))}
    </List>
  )
}

export default ActivityListItemAttendees
