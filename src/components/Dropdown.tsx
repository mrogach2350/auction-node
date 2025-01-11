import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleDown } from "@fortawesome/free-solid-svg-icons";

export default function Dropdown({ listItems = [] }: { listItems: any[] }) {
  const [showOptions, setShowOptions] = useState<boolean>(false);

  return (
    <div className={`dropdown ${showOptions && "is-active"}`}>
      <div className="dropdown-trigger">
        <button className="button" onClick={() => setShowOptions(!showOptions)}>
          <span>Lists</span>
          <span className="icon is-small">
            <FontAwesomeIcon icon={faAngleDown} />
          </span>
        </button>
      </div>
      <div className="dropdown-menu" id="dropdown-menu" role="menu">
        <div className="dropdown-content">
          {listItems.map((item) => (
            <a key={item.id} className="dropdown-item">
              {item.text}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
