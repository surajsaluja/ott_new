import { useEffect, useRef, useState } from "react";
import "./BottomDrawer.css";
import {
  FocusContext,
  useFocusable,
} from "@noriginmedia/norigin-spatial-navigation";
import FocusableButton from "../FocusableButton";
import { IoArrowBackCircleOutline } from "react-icons/io5";

export default function BottomDrawer({ isOpen, onClose, children, focusKey }) {
  const [hasMounted, setHasMounted] = useState(false);
  
  const {
    focusKey: currentFocusKey,
    ref,
    focusSelf,
  } = useFocusable({
    focusable: true,
    trackChildren: false,
    focusKey,
    saveLastFocusedChild: false,
    onArrowPress:(direction)=>{
      console.log(`${direction} pressed in bottom drawer`);
    }
  });

  useEffect(() => {
    if (isOpen && !hasMounted) {
      setHasMounted(true);
    }
  }, [isOpen, hasMounted]);

  useEffect(() => {
    if(isOpen){
    focusSelf();
    }
  }, [focusSelf, isOpen]);

  return (
    isOpen && (
      <FocusContext.Provider value={currentFocusKey}>
        <div
          className={`bottom-drawer ${
            isOpen && hasMounted ? "drawer-open" : "drawer-closed"
          }`}
          ref={ref}
        >
          <div className="drawer-content">
            <div className="back-btn-bottom-drawer">
              <FocusableButton
                icon={<IoArrowBackCircleOutline />}
                onEnterPress={onClose}
                onArrowPress={(direction)=>{
                  if(direction === 'up'){
                    onClose();
                  }
                }}
              />
            </div>
            {children}
          </div>
        </div>
      </FocusContext.Provider>
    )
  );
}
