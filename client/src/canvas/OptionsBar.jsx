function OptionsBar(){
    return (
        <>
            <div className="flex flex-row pointer-events-auto justify-end">
                <button className="primary-button moving-animation px-5 py-2 m-5">Login</button>
                <button className="primary-button moving-animation px-5 py-2 m-5 mr-10">Collab</button>
            </div>
        </>
    );
}

export default OptionsBar;