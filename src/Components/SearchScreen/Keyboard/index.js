import React, { useEffect, useState } from 'react';
import { FocusContext, useFocusable } from '@noriginmedia/norigin-spatial-navigation';
import FocusableButton from '../../Common/FocusableButton'

import '../index.css'
import { FaDeleteLeft } from 'react-icons/fa6';
import { MdDelete } from 'react-icons/md';

const ALPHA_KEYS = [
  ['A','B','C','D','E','F','G'],
  ['H','I','J','K','L','M','N'],
  ['O','P','Q','R','S','T','U'],
  ['V','W','X','Y','Z','delete', 'clear'],
];

const NUM_KEYS= [
    ['1','2','3','4'],
    ['5','6','7','8'],
    ['9','0','delete','clear'],
]

export const SearchKeyboard = ({ onKeyPress =(key)=>{}, focusKey }) => {
    const [isKeyBoardNumeric, setIsKeyboardNumeric]  = useState(false);
    const {ref, focusKey: currentFocusKey, focusSelf} = useFocusable({focusKey});
     const currentLayout = isKeyBoardNumeric ? NUM_KEYS : ALPHA_KEYS;

    useEffect(()=>{
        focusSelf();
    },[focusSelf])

  return (
    <FocusContext.Provider value={currentFocusKey}>
    <div className="keyboard" ref={ref}>
      {currentLayout.map((row, i) => (
        <div key={i} className="keyboard-row">
          {row.map((key) => (
            key === ' ' ? (<div className='keyboard-key flex-1'></div>) : 
            (<FocusableButton 
                key={key} 
                text={key == 'delete' || key == 'clear' ? '' : key} 
                icon={((key == 'delete' && <FaDeleteLeft/>) || (key == 'clear' && <MdDelete/>))}
                onEnterPress={()=>{onKeyPress(key)}}
                className={`keyboard-key flex-1`}
                focusClass={`keyboard-key-focused`}
                 />)
          ))}
        </div>
      ))}
      <div className='keyboard-row'>
        <FocusableButton
            text = "Space"
            className={`keyboard-space keyboard-key`}
            focusClass={`keyboard-key-focused`}
            onEnterPress={()=>{onKeyPress(' ')}}
         />
         <FocusableButton
         text={`${isKeyBoardNumeric ? 'ABC': '123'}`}
         className={`keyboard-switcher keyboard-key`}
         focusClass={`keyboard-key-focused`}
         onEnterPress={() => setIsKeyboardNumeric(prev => !prev)}

         />
      </div>
    </div>
    </FocusContext.Provider>
  );
};
