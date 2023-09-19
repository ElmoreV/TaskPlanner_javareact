



const ViewSelector = (e) => {
    const handleClick = ()=>{
        console.log("Test",e);
    }
    

    return ( <div className="view-select">
        <h3 onClick={handleClick}>Per topic</h3>
        <h3>Weekly</h3>
        <h3>Daily</h3>
        
    </div> );
}
 
export default ViewSelector;