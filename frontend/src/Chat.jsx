import React, { useEffect, useState } from "react"
import { CardContent, Card, FormField, Form, Input, MessageHeader, Message, Divider, Grid, List } from 'semantic-ui-react'
import ScrollToBottom from "react-scroll-to-bottom"

const Chat = ({socket, username, room}) => {

    const [currentMessage, setCurrentMessage] = useState ("")
    const [messagesList, setMessageList] = useState ([])
    const [users, setUsers] = useState([])
    const [newMessageAlert, setNewMessageAlert] = useState(null)

    const sendMessage = async () => {
        if (username && currentMessage){
            const info = {
                message: currentMessage,
                room,
                author: username,
                time: new Date(Date.now()).getHours() + ":" + new Date (Date.now()).getMinutes(),
            };
            
            await socket.emit("send_message", info);
            setMessageList((list) => [... list,info]);
            setCurrentMessage("")
        }
    }

    useEffect(() =>{
        const messageBody = (data) => {
            setMessageList((list) => [... list,data]);
            if (data.author !== username) {
                setNewMessageAlert(data.author)
                setTimeout(() => setNewMessageAlert(null), 3000) // Ocultar alerta después de 3 segundos
            }
        }
        socket.on("receive_message", messageBody);
        return()=>socket.off("receive_message", messageBody);
    },[socket, username])

    useEffect(() =>{
        const updateUserList = (data) => {setUsers(data);}
        socket.on("update_users", updateUserList);
        return()=>socket.off("update_users", updateUserList);
    },[socket])

    useEffect(() => {
        const previousMessages = (data) => { setMessageList(data) }
        socket.on("previous_messages", previousMessages)
        return () => socket.off("previous_messages", previousMessages)
    }, [socket])

  return (
    <div className="chat">
        <Grid>
            <Grid.Column width={4}>
                <Card fluid>
                    <CardContent header={`Usuarios en Sala ${room}`} />
                    <CardContent>
                        <List>
                            {users.map((user, i) => (
                                <List.Item key={i}>
                                    <List.Icon name='user' />
                                    <List.Content>
                                        {user.username}
                                        {newMessageAlert === user.username && <span style={{ color: 'red', marginLeft: '10px' }}>NUEVO MENSAJE</span>}
                                    </List.Content>
                                </List.Item>
                            ))}
                        </List>
                    </CardContent>
                </Card>
            </Grid.Column>
            <Grid.Column width={12}>
                <Card fluid>
                    <CardContent header={`Bienvenidos | Sala ${room}`} />
                    <ScrollToBottom>
                        <CardContent style={{ height: "300px", padding: "5px" }}>
                            {
                                messagesList.map((item, i) => {
                                    return (
                                        <span key={i}>
                                            <Message style={{ textAlign: username === item.author ? 'right' : 'left' }}
                                                success={username === item.author}
                                                info={username !== item.author}
                                            >
                                                <MessageHeader> {item.message} </MessageHeader>
                                                <p> {item.time} {item.author} </p>
                                            </Message>
                                            <Divider />
                                        </span>
                                    )
                                })
                            }
                        </CardContent>
                    </ScrollToBottom>
                    <CardContent extra>
                        <Form>
                            <FormField>
                                <Input 
                                    action={{
                                        color: 'teal',
                                        labelPosition: 'right',
                                        icon: 'send',
                                        content: 'ENVIAR',
                                        onClick: sendMessage,
                                    }}
                                    type='text' value={currentMessage} placeholder='Mensaje' onChange={e => setCurrentMessage(e.target.value)}
                                />
                            </FormField>
                        </Form>
                    </CardContent>
                </Card>
            </Grid.Column>
        </Grid>
    </div>
  )
}

export default Chat