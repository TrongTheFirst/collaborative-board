import { Outlet } from "react-router-dom"
import Board from "../canvas/Board";

function Layout()  {
    return (
        <div className='container'>
            <main>
                <Outlet />
                <Board />
            </main>
        </div>
    )
}

export default Layout