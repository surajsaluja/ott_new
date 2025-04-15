import React, { useCallback, useEffect, useRef } from 'react'
import { FocusContext, useFocusable } from '@noriginmedia/norigin-spatial-navigation'
import FocusableButton from '../FocusableButton/FocusableButton'
import useMenu from './Hooks/useMenu';
import './Menu.css';
// import { withRouter } from 'react-router-dom';
function Menu({ focusKey, Menu, location, history }) {   

    const { menuItems, loading, selectedMenu, onMenuEnterPress, ref, currentFocusKey, hasFocusedChild,menuScrollingRef, onMenuFocus } = useMenu(focusKey);
    debugger;

    return (
        <FocusContext.Provider value={currentFocusKey}>
            <div ref={ref} className={`menuContainer ${hasFocusedChild ? 'menuContainer_focused' : ''}`}>
                <div className={`menuScrollingWrapper`} ref={menuScrollingRef}>
                    {menuItems.map((item)=>(
                    <FocusableButton
                    key={item.id}
                    text={item.text}
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