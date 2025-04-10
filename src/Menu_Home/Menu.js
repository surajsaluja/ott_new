import React, { useCallback, useEffect, useRef } from 'react'
import { FocusContext, useFocusable } from '@noriginmedia/norigin-spatial-navigation'
import FocusableButton from '../FocusableButton/FocusableButton'
import './Menu.css';
// import { withRouter } from 'react-router-dom';
function Menu({ focusKey, Menu, location, history }) {   

    const { ref, focusKey: currentFocusKey, hasFocusedChild } = useFocusable({
        focusable: true,
        trackChildren: true,
        focusKey,
        saveLastFocusedChild: true
    });

    const menuScrollingRef = useRef(null);

    const onMenuFocus  = useCallback((({y})=>{
        menuScrollingRef.current.scrollTo({
            top: y - 20,
            behavior: 'smooth'
        });
    }),[menuScrollingRef]);

    const onMenuEnterPress = () =>{
       // history.push("/search",{});
    }

    return (
        <FocusContext.Provider value={currentFocusKey}>
            <div ref={ref} className={`menuContainer ${hasFocusedChild ? 'menuContainer_focused' : ''}`}>
                <div className={`menuScrollingWrapper`} ref={menuScrollingRef}>
                    {Menu.map((item)=>(
                    <FocusableButton
                    key={item.id}
                    text={item.label}
                    className='menuItem'
                    focusClass='menuItem_focused'
                    onFocus={onMenuFocus}
                    onEnterPress={onMenuEnterPress}
                />    
                    ))}                   
                </div>
            </div>
        </FocusContext.Provider>
    )
}

export default Menu