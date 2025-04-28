import { useEffect, useRef, useState } from "react";
import "./BottomDrawer.css";
import { FocusContext, useFocusable } from "@noriginmedia/norigin-spatial-navigation";
import FocusableButton from "../FocusableButton";
import { MdArrowBack } from "react-icons/md";

export default function BottomDrawer({ isOpen, onClose, children }) {
  const drawerRef = useRef();
  const [hasMounted, setHasMounted] = useState(false);
  const { focusKey: currentFocusKey,ref, focusSelf } = useFocusable('BOTTOM_DRAWER');

  useEffect(() => {
    if (isOpen && !hasMounted) {
      setHasMounted(true);
    }
  }, [isOpen, hasMounted]);

  // useEffect(()=>{
  //   focusSelf();
  // },[focusSelf,isOpen])

  return (
    isOpen && (
      <div
        className={`bottom-drawer ${isOpen && hasMounted ? "drawer-open" : "drawer-closed"}`}
      >
        <FocusContext.Provider value={currentFocusKey}>
          <div className="drawer-content" ref={ref}>
            <div className="back-btn-bottom-drawer">
                <FocusableButton
                icon={<MdArrowBack/>}
                onEnterPress={onClose}
                />
            </div>
            {children}
          </div>
        </FocusContext.Provider>
      </div>
    )
  );
}