import { createBrowserRouter, RouterProvider } from "react-router-dom";
import NotFound from "./NotFound.jsx";
import Board from "../canvas/Board.jsx";

function AppRouter() {
    const routes = [
        {
            path: "/",
            element: <Board />,
            errorElement: <div>Something went wrong on our side</div>
        },
        {
            path: "*",
            element: <NotFound />
        }
    ];

    const router = createBrowserRouter(routes);

    return <RouterProvider router={router} />;
}

export default AppRouter;