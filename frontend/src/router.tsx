import { createBrowserRouter } from "react-router-dom";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { ChatHome } from "./pages/ChatHome";
import Container from "./components/common/Container";
import GuardedHOC from "./components/chat/GuardedComponent";
import { UserProfile } from "./pages/UserProfile";
import { DiscoverUsers } from "./pages/DiscoverUsers";
import { ConnectionGroups } from "./pages/ConnectionGroups";
import { ErrorBoundary } from "react-error-boundary";
import { ErrorFallback } from "./components/common/ErrorFallback";



const HOCWithContainer = (OriginalComponent:any) => {
    function NewComponent(props:any) {
      return (
        <ErrorBoundary FallbackComponent={ErrorFallback}>
        <Container>
          <OriginalComponent {...props} />
        </Container>
         </ErrorBoundary>
      );
    }
    return NewComponent;
};
  

const WrappedChatHome = HOCWithContainer(ChatHome)
const WrappedProfile = HOCWithContainer(UserProfile)
const WrappedDiscover = HOCWithContainer(DiscoverUsers)
const WrappedRegister = HOCWithContainer(Register)
const WrappedLogin= HOCWithContainer(Login)
const WrappedConnectionAndGroups= HOCWithContainer(ConnectionGroups)
const GuardedChatHome = GuardedHOC(WrappedChatHome)
const GuardedProfile = GuardedHOC(WrappedProfile)
const GuardedDiscoverUsers = GuardedHOC(WrappedDiscover)
const GuardedConnectionAndGroups = GuardedHOC(WrappedConnectionAndGroups)


export const router = createBrowserRouter([
    {
      element: <GuardedChatHome />,
      path: ""
    },
    {
        path: "/register",
        element: <WrappedRegister/>
      },
      {
        path: "/login",
        element: <WrappedLogin/>,
      },
      {
        element: <GuardedProfile />,
        path: "/profile"
      },
      {
        element: <GuardedDiscoverUsers />,
        path: "/discover"
      },
      {
        element: <GuardedConnectionAndGroups />,
        path: "/connectionlibrary"
      }
 ])