import { FC } from "react";

export const ChatHome:FC = ()=>{
    return <>
        <html>
    <head>
        <link rel="stylesheet" href="style.css">
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">
    </head>
    <body>
        <div class="full">
            <!-- left side container -->
            <div class="contacts-container">
                <div class="chat-contact-search-div">
                    <h3>Chats</h3>
                    <input 
                    class="chat-contact-search"
                    placeholder="Search messages or users">
                </div>
                
                <div class="recent-messages">
                    <h4>Recent</h4>
                    <ul>
                        <li >
                            <div class="chat-row">
                                <img 
                                class="chat-avatar-small"
                                src="http://chatvia-light.react.themesbrand.com/static/media/avatar-2.feb0f89de58f0ef9b424.jpg">
                                <div>
                                    <strong><span>Patrick Hendricks</span></strong>
                                    <p>THis theme is awesome</p>
                                </div>
                            </div>
                            
                        </li>
                        <li >
                            <div class="chat-row chat-row-selected">
                                <img 
                                class="chat-avatar-small"
                                src="http://chatvia-light.react.themesbrand.com/static/media/avatar-2.feb0f89de58f0ef9b424.jpg">
                                <div>
                                    <strong><span>Patrick Hendricks</span></strong>
                                    <p>THis theme is awesome</p>
                                </div>
                            </div>
                            
                        </li>
                    </ul>
                </div>
                
            </div>
            <!-- right side message container -->
            <div class="message-container">
                <div class="message-container-header">
                    <div class="message-image-container">
                        <img 
                        class="chat-avatar"
                        src="http://chatvia-light.react.themesbrand.com/static/media/avatar-2.feb0f89de58f0ef9b424.jpg">
                        <strong><span>Patrick Hendricks</span></strong>
                        <span class="chat-active">&#8203;</span>
                    </div>
                    <div class="message-search-more-container">
                        <i class="fa fa-search"></i>
                        <i class="fa fa-ellipsis-h" style="font-size:15px"></i>
                    </div>
                </div>
                <div class="message-container-main">

                </div>
                
                <div class="message-container-footer">
                    <input class="message-input" placeholder="Enter Message">
                    <div class="message-button-container">
                        <i class="fa fa-image"></i>
                        <i class="fa fa-paper-plane" aria-hidden="true"></i>
                    </div>
                </div>
            </div>
        </div>

    </body>
</html>
    </>
}
