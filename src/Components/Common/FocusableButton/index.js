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
    onArrowPress = () =>{}
}) => {

    const { ref, focused } = useFocusable({
        focusKey: focusKeyParam,
        focusable,
        onEnterPress,
        onArrowPress,
        onFocus,
        trackChildren: false,
        saveLastFocusedChild: false
    });

    return (
        <div ref={ref}
            className={`${styleClass} ${focused ? (focusClass ? focusClass : 'defaultFocusClass') : ''}`}
            style={{ ...customStyles }}
        >
            {icon && <span className={'focusableButton_icon'}>{icon}</span>}

            {text && <span className={'focusableButton_text'}>{text}</span>}
        </div>
    )
};

export default FocusableButton