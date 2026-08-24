import { Outlet } from "react-router-dom"

function Layout()  {
    return (
        <div className='container'>
            <header className='mb-3'>
                Hello
            </header>
            <main>
                <Outlet />
            </main>
        </div>
    )
}

export default Layout