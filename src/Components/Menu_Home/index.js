import React, { useCallback, useEffect, useRef } from 'react'
import { FocusContext} from '@noriginmedia/norigin-spatial-navigation'
import FocusableButton from '../Common/FocusableButton'
import useMenu from './Hooks/useMenu';
import './index.css';
import { kableOneLogo } from '../../assets';

function Menu_Home({ activeTab, focusKey}) {   

    const { 
        menuItems, 
        loading,
        focusSelf, 
        selectedMenu,
        onMenuEnterPress, 
        ref, 
        currentFocusKey, 
        hasFocusedChild,
        menuScrollingRef, 
        onMenuFocus, 
        getIconComponent 
    } = useMenu(activeTab,focusKey);

    useEffect(()=>{
        focusSelf();
    },[loading])

    const openBrowser = () => {
    if (window.tizen && window.tizen.application) {
      const appControl = new window.tizen.ApplicationControl(
        'http://tizen.org/appcontrol/operation/view',
        'https://www.kableone.com/' // Replace with your URL
      );

      window.tizen.application.launchAppControl(
        appControl,
        null,
        () => console.log('Browser launched successfully'),
        (err) => console.error('Error launching browser:', err),
        null
      );
    } else {
      console.error('Tizen API not available');
    }
  };

    return (
        <FocusContext.Provider value={currentFocusKey}>
            <div ref={ref} className={`menuContainer ${hasFocusedChild ? 'menuContainer_focused' : ''}`}>
                <div className='menu-logo-container'>
                <img src={kableOneLogo} className={hasFocusedChild ? 'menu-logo' : 'menu-logo-small'}></img>
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

export default Menu_Home