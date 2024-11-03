
export const Dropper = () => {
    return <div className="d-flex vh-100 text-center text-bg-dark">
        <div className="d-flex w-100 h-100 p-3 mx-auto flex-column">
            <header className="mb-auto">
                <div>
                    <h3 className="float-md-start mb-0">music.roygdavis.dev</h3>
                </div>
            </header>

            <main className="px-3">
                <h1>Drop it like it's hot</h1>
                <p className="lead">Find your audio file, drag & drop it on this page, mesmerise yourself in visual glory.</p>
            </main>

            <footer className="mt-auto text-white-50">
                <p>Site by <a href="https://github.com/roygdavis/music" className="text-white">Roy G Davis</a>, using <a href="https://github.com/jberg/butterchurn" className="text-white">Butterchurn </a>with <i className="text-white bi bi-heart-fill"></i>.</p>
            </footer>
        </div>
    </div>
}

export default Dropper;