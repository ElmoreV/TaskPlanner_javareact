import {useState} from 'react';

const Topic = (props) => {
    const title = props.title;
    const id = props.id;
    const toggleFold = props.toggleFold;
    const unfold = props.unfold;

    const folded_symbol = '>';
    const unfolded_symbol = 'v';
/*onClick={()=>(toggleCollapse(id))}*/
    return ( <div className='topic' onClick={()=>toggleFold(id)}>{unfold?unfolded_symbol:folded_symbol} {title}</div> );
}
 
export default Topic;