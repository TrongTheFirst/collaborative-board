import Layout from "./Layout.jsx";
import { createBrowserRouter, RouterProvider } from "react-router-dom"
import LoginForm from "../users/LoginForm.jsx";
import NotFound from "./NotFound.jsx";
import Board from "../canvas/Board.jsx";

function AppRouter(){
    const routes = [{
        path: "",
        element: <Board />,
        errorElement: <div>Something went wrong on our side</div>,
        children: [
            {
              path: "users/register",
              element: <LoginForm isLogin={false} />
            },
            {
                path: "users/login",
                element: <LoginForm isLogin={true} />
            },
            {
                path: "*",
                element: <NotFound />
            }
        ]
    }]

    const router = createBrowserRouter(routes)

    return <RouterProvider router={router} />
}

export default AppRouter;