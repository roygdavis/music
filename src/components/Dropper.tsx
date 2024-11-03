
export const Dropper = () => {
    return <div className="w-100 d-flex text-center text-bg-dark">
        <div className="w-100 d-flex p-3 mx-auto flex-column">
            <header className="mb-auto">
                <div className="d-flex flex-column float-start">
                    <h3 className="text-start">music.roygdavis.dev</h3>
                    <p className="text-start mb-0">Site by <a href="https://github.com/roygdavis/music" className="text-white">Roy G Davis</a>, using <a href="https://github.com/jberg/butterchurn" className="text-white"> Butterchurn </a>with <i className="text-white bi bi-heart-fill"></i>.</p>
                </div>
            </header>

            <main className="px-3">
                <h1>Drop it like it's hot</h1>
                <p className="lead">Find your audio file, drag & drop it on this page, mesmerise yourself in visual glory.</p>
            </main>

            <footer className="mt-auto text-white-50">

            </footer>
        </div>
    </div>
}

export default Dropper;