import { createBrowserRouter } from "react-router-dom";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { RouteGuardWrapper } from "./components/RouteGuardWrapper";
import { ChatHome } from "./pages/ChatHome";
import Container from "./common/Container";


const HOCWithContainer = (OriginalComponent) => {
    function NewComponent(props) {
      return (
        <Container>
          <OriginalComponent {...props} />
        </Container>
      );
    }
    return NewComponent;
  };
  
const WrappedChatHome = HOCWithContainer(ChatHome)
const WrappedRegister = HOCWithContainer(Register)
const WrappedLogin= HOCWithContainer(Login)


export const router = createBrowserRouter([
    {
      element: <RouteGuardWrapper />,
      children: [
        {
          path: "",
          element: <WrappedChatHome />,
        },
      ]
    },
    {
        path: "/register",
        element: <WrappedRegister/>
      },
      {
        path: "/login",
        element: <WrappedLogin/>,
      }
 ])