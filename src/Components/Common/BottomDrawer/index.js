import { useEffect, useRef, useState } from "react";
import "./BottomDrawer.css";
import { FocusContext, useFocusable } from "@noriginmedia/norigin-spatial-navigation";
import FocusableButton from "../FocusableButton";
import { MdArrowBack } from "react-icons/md";

export default function BottomDrawer({ isOpen, onClose, children,focusKey }) {
  const [hasMounted, setHasMounted] = useState(false);
  const { focusKey: currentFocusKey,ref, focusSelf } = useFocusable({
    focusable: true,
        trackChildren: false,
        focusKey,
        saveLastFocusedChild: false
  });

  useEffect(() => {
    if (isOpen && !hasMounted) {
      setHasMounted(true);
    }
  }, [isOpen, hasMounted]);

  useEffect(()=>{
    focusSelf();
  },[focusSelf,isOpen])

  return (
    isOpen && (
      <FocusContext.Provider value={currentFocusKey}>
      <div
        className={`bottom-drawer ${isOpen && hasMounted ? "drawer-open" : "drawer-closed"}`}
        >
        
          <div className="drawer-content">
            <div className="back-btn-bottom-drawer" ref={ref}>
                <FocusableButton
                icon={<MdArrowBack/>}
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