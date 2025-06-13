import React from "react";
import { useFocusable } from "@noriginmedia/norigin-spatial-navigation";
import './index.css'

const FocusableButton = ({
    text = '',
    customStyles = {},
    focuskey: focusKeyParam,
    onEnterPress = () => { },
    onFocus = () => {},
    className: styleClass = '',
    icon = '',
    focusClass = '',
    focusable = true,
}) => {

    const { ref, focused } = useFocusable({
        focusKey: focusKeyParam,
        focusable,
        onEnterPress,
        onFocus,
        trackChildren: true,
        saveLastFocusedChild: true
    });

    return (
        <div ref={ref}
            className={`${styleClass} ${focused ? (focusClass ? focusClass : 'defaultFocusClass') : ''}`}
        >
            {icon && <span className={'focusableButton_icon'}>{icon}</span>}

            {text && <span className={'focusableButton_text'}>{text}</span>}
        </div>
    )
};

export default FocusableButton