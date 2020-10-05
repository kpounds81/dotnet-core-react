import { observer } from "mobx-react"
import React, { FunctionComponent } from "react"
import { Link } from "react-router-dom"
import { Segment, Image, Button, Header, Item } from "semantic-ui-react"
import { Activity } from "../../../models/Activity"

const activityImageStyle = {
  filter: "brightness(30%)",
}

const activityImageTextStyle = {
  position: "absolute",
  bottom: "5%",
  left: "5%",
  width: "100%",
  height: "auto",
  color: "white",
}

const ActivityDetailsHeader: FunctionComponent<{ activity: Activity }> = ({ activity }) => {
  return (
    <Segment.Group>
      <Segment basic attached="top" style={{ padding: "0" }}>
        <Image src={`/assets/categoryImages/${activity.category}.jpg`} fluid style={activityImageStyle} />
        <Segment basic style={activityImageTextStyle}>
          <Item.Group>
            <Item>
              <Item.Content>
                <Header size="huge" content={activity.title} style={{ color: "white" }} />
                <p>{activity.date}</p>
                <p>
                  Hosted by <strong>Bob</strong>
                </p>
              </Item.Content>
            </Item>
          </Item.Group>
        </Segment>
      </Segment>
      <Segment clearing attached="bottom">
        <Button color="teal">Join Activity</Button>
        <Button>Cancel attendance</Button>
        <Button color="orange" floated="right" as={Link} to={`/manage/${activity.id}`}>
          Manage Event
        </Button>
      </Segment>
    </Segment.Group>
  )
}

export default observer(ActivityDetailsHeader)
