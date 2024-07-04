import { FC, useEffect } from "react";
import './chathome.css'
import { socket } from "../socket";
import avatarImage from './../assets/test_avatar_image.jpg';
export const ChatHome:FC = ()=>{
    useEffect(()=>{
        function onConnect() {
            console.log('socket connected')
          }
          socket.on('connect',onConnect)

        socket.on('foo', (value) => {
            console.log('on foo event value',value)
          });

        return()=>{
            socket.off('foo');
        }
    },[])
    return <div className="full container">
             {/* left side container  */}
            <div className="contacts-container">
                <div className="chat-contact-search-div">
                    <h3>Chats</h3>
                    <input 
                    className="chat-contact-search"
                    placeholder="Search messages or users"/>
                </div>
                
                <div className="recent-messages">
                    <h4>Recent</h4>
                    <ul>
                        <li >
                            <div className="chat-row">
                                <img 
                                className="chat-avatar-small"
                                src={avatarImage}/>
                                <div>
                                    <strong><span>Patrick Hendricks</span></strong>
                                    <p>THis theme is awesome</p>
                                </div>
                            </div>
                            
                        </li>
                        
                        <li >
                            <div className="chat-row">
                                <img 
                                className="chat-avatar-small"
                                src={avatarImage}/>
                                <div>
                                    <strong><span>Patrick Hendricks</span></strong>
                                    <p>THis theme is awesome</p>
                                </div>
                            </div>
                            
                        </li>
                        
                        <li >
                            <div className="chat-row chat-row-selected">
                                <img 
                                className="chat-avatar-small"
                                src={avatarImage}/>
                                <div>
                                    <strong><span>Patrick Hendricks</span></strong>
                                    <p>THis theme is awesome</p>
                                </div>
                            </div>
                            
                        </li>
                        <li >
                            <div className="chat-row chat-row-selected">
                                <img 
                                className="chat-avatar-small"
                                src={avatarImage}/>
                                <div>
                                    <strong><span>Patrick Hendricks</span></strong>
                                    <p>THis theme is awesome</p>
                                </div>
                            </div>
                            
                        </li>
                        <li >
                            <div className="chat-row chat-row-selected">
                                <img 
                                className="chat-avatar-small"
                                src={avatarImage}/>
                                <div>
                                    <strong><span>Patrick Hendricks</span></strong>
                                    <p>THis theme is awesome</p>
                                </div>
                            </div>
                            
                        </li>
                        <li >
                            <div className="chat-row chat-row-selected">
                                <img 
                                className="chat-avatar-small"
                                src={avatarImage}/>
                                <div>
                                    <strong><span>Patrick Hendricks</span></strong>
                                    <p>THis theme is awesome</p>
                                </div>
                            </div>
                            
                        </li>
                        <li >
                            <div className="chat-row chat-row-selected">
                                <img 
                                className="chat-avatar-small"
                                src={avatarImage}/>
                                <div>
                                    <strong><span>Patrick Hendricks</span></strong>
                                    <p>THis theme is awesome</p>
                                </div>
                            </div>
                            
                        </li>
                        <li >
                            <div className="chat-row chat-row-selected">
                                <img 
                                className="chat-avatar-small"
                                src={avatarImage}/>
                                <div>
                                    <strong><span>Patrick Hendricks</span></strong>
                                    <p>THis theme is awesome</p>
                                </div>
                            </div>
                            
                        </li>
                        <li >
                            <div className="chat-row chat-row-selected">
                                <img 
                                className="chat-avatar-small"
                                src={avatarImage}/>
                                <div>
                                    <strong><span>Patrick Hendricks</span></strong>
                                    <p>THis theme is awesome</p>
                                </div>
                            </div>
                            
                        </li>
                        <li >
                            <div className="chat-row chat-row-selected">
                                <img 
                                className="chat-avatar-small"
                                src={avatarImage}/>
                                <div>
                                    <strong><span>Patrick Hendricks</span></strong>
                                    <p>THis theme is awesome</p>
                                </div>
                            </div>
                            
                        </li>
                        
                    </ul>
                </div>
                
            </div>
             {/* right side message container  */}
            <div className="message-container">
                <div className="message-container-header">
                    <div className="message-image-container">
                        <img 
                        className="chat-avatar"
                        src={avatarImage}/>
                        <strong><span>Patrick Hendricks</span></strong>
                        <span className="chat-active">&#8203;</span>
                    </div>
                    <div className="message-search-more-container">
                        <i className="fa fa-search"></i>
                        <i className="fa fa-ellipsis-h" style={{fontSize:"15px"}}></i>
                    </div>
                </div>
                <div className="message-container-main">

                </div>
                
                <div className="message-container-footer">
                    <input className="message-input" placeholder="Enter Message"/>
                    <div className="message-button-container">
                        <i className="fa fa-image"></i>
                        <i className="fa fa-paper-plane" aria-hidden="true"></i>
                    </div>
                </div>
            </div>
        </div>
    
}
