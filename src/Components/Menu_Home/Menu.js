import React, { useCallback, useEffect, useRef } from 'react'
import { FocusContext} from '@noriginmedia/norigin-spatial-navigation'
import FocusableButton from '../Common/FocusableButton/FocusableButton'
import useMenu from './Hooks/useMenu';
import './Menu.css';
// import { withRouter } from 'react-router-dom';
function Menu({ focusKey, Menu, location, history }) {   

    const { menuItems, loading,focusSelf, selectedMenu,onMenuEnterPress, ref, currentFocusKey, hasFocusedChild,menuScrollingRef, onMenuFocus, getIconComponent } = useMenu(focusKey);
    const logo = require('../../assets/images/KableoneretailLogo.webp');

    useEffect(()=>{
        focusSelf();
    },[loading])

    return (
        <FocusContext.Provider value={currentFocusKey}>
            <div ref={ref} className={`menuContainer ${hasFocusedChild ? 'menuContainer_focused' : ''}`}>
                <div className='menu-logo-container'>
                <img src={logo} className={hasFocusedChild ? 'menu-logo' : 'menu-logo-small'}></img>
                </div>
                <div className={`menuScrollingWrapper`} ref={menuScrollingRef}>
                    {menuItems.map((item)=>(
                    <FocusableButton
                    key={item.id}
                    text={hasFocusedChild ? item.text : ''}
                    className={`menuItem ${selectedMenu == item.id ? 'selected' : ''}`}
                    focusClass='menuItem_focused'
                    onFocus={onMenuFocus}
                    icon={getIconComponent(item)}
                    onEnterPress={() => onMenuEnterPress(item)}
                />    
                    ))}                   
                </div>
            </div>
        </FocusContext.Provider>
    )
}

export default Menu