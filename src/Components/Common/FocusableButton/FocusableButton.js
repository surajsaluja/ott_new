import React from "react";
import { useFocusable } from "@noriginmedia/norigin-spatial-navigation";
import './FocusableButton.css'

const FocusableButton = ({
    text = '',
    customStyles = {},
    focuskey: focusKeyParam,
    onEnterPress = () => { },
    onFocus = () => {},
    className: styleClass = '',
    icon = '',
    focusClass = ''
}) => {

    const { ref, focused } = useFocusable({
        focusKey: focusKeyParam,
        onEnterPress,
        onFocus,
        trackChildren: true,
        saveLastFocusedChild: true
    });

    return (
        <div ref={ref}
            className={`${styleClass} ${focused ? (focusClass ? focusClass : 'defaultFocusClass') : ''}`}
        >
            <span className={'focusableButton_icon'}>{icon}</span>

            <span className={'focusableButton_text'}>{text}</span>
        </div>
    )
};

export default FocusableButton