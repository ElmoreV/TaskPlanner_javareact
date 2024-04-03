
const Theme=(props)=>{
    const {darkMode, children}=props
    console.log(darkMode)
    return(
        <div className={darkMode ? 'dark' : 'light'}>
            {children}
        </div>
    )
}

export default Theme