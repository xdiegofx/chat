import io from 'socket.io-client'
import './App.css'
import Chat from './Chat'
import { useState } from 'react'
import { CardContent, Card,Container, FormField, Button, Form } from 'semantic-ui-react'

const socket = io.connect("http://localhost:3001")

function App() {
  const [username, setUsername] = useState ("")
  const [usernick, setUserNick] = useState ("")
  //const [room, setRoom] = useState ("")
  const [showChat, setShowChat] = useState (false)

  const joinRoom = () => {
    if (username != "" && usernick != ""){
      const room = "1";
      socket.emit("join_room", {username, room} );
      setShowChat(true)
    }
  }

  return (
    <>
    <Container>
      { !showChat?(
      <Card fluid>
        <CardContent header='Ingresar al Chat' />
        <CardContent>
          <Form>
            <FormField>
              <label>Nombre de usuario</label>
              <input type='text' placeholder='Usuario' onChange={e => setUsername(e.target.value)} />
            </FormField>
            <FormField>
              <label>Nick</label>
              <input type='text' placeholder='Nick' onChange={e => setUserNick(e.target.value)} />
            </FormField>
            <Button onClick={joinRoom}>Ingresar</Button>
          </Form>
        </CardContent>
      </Card>
      ):(
      <Chat socket={socket} username={username} usernick={usernick} room={"1"}/>
      )}
    
    </Container>
    </>
  )
}

export default App
