import { useEffect, useRef, useState } from "react";
import "./BottomDrawer.css";
import {
  FocusContext,
  useFocusable,
} from "@noriginmedia/norigin-spatial-navigation";
import FocusableButton from "../FocusableButton";
import { IoArrowBackCircleOutline } from "react-icons/io5";
import useOverrideBackHandler from "../../../Hooks/useOverrideBackHandler";

export default function BottomDrawer({ isOpen, onClose, children, focusKey }) {
  const [hasMounted, setHasMounted] = useState(false);
  
  // Close the drawer instead of navigating back
  useOverrideBackHandler(() => {
    onClose(); 
  });
  
  const {
    focusKey: currentFocusKey,
    ref,
    focusSelf,
  } = useFocusable({
    focusable: true,
    trackChildren: false,
    focusKey,
    saveLastFocusedChild: false,
  });

  useEffect(() => {
    if (isOpen && !hasMounted) {
      setHasMounted(true);
    }
  }, [isOpen, hasMounted]);

  useEffect(() => {
    focusSelf();
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
              />
            </div>
            {children}
          </div>
        </div>
      </FocusContext.Provider>
    )
  );
}
