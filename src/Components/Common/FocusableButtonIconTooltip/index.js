import React from "react";
import { useFocusable } from "@noriginmedia/norigin-spatial-navigation";
import './index.css';

const FocusableButtonIconTooltip = ({
    text = '',
    customStyles = {},
    focuskey: focusKeyParam,
    onEnterPress = () => {},
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
        <div
            ref={ref}
            className={`focusableButton-tooltip-wrapper ${styleClass} ${focused ? (focusClass || 'defaultFocusClass-tooltip-button') : ''}`}
            style={customStyles}
        >
            <span className='focusableButton_icon-tooltip-button'>{icon}</span>
            {focused && (
                <span className='focusableButton_tooltip'>{text}</span>
            )}
        </div>
    );
};

export default FocusableButtonIconTooltip;
