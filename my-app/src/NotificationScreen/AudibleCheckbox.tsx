// CheckboxWarning.tsx
import React, { useState } from "react";
import "./AudibleCheckbox.scss";

interface AudibleCheckboxProps {
    isWarning: boolean;
    label?: string;
    disabled?: boolean;
    onChange?: () => void;
}

const AudibleCheckbox: React.FC<AudibleCheckboxProps> = ({ isWarning, label, disabled, onChange }) => {
    const [checked, setChecked] = useState(false);

    const handleClick = () => {
        if (!disabled && !isWarning) {
            setChecked(!checked);
            onChange?.();
        }
    };

    return (
        <div className="audible-checkbox" onClick={handleClick}>
            <div
                className={`audible-checkbox__box ${isWarning ? 'audible-checkbox__box--warning' :
                    checked ? 'audible-checkbox__box--checked' : ''
                    }`}
            />
            {label && <span className="audible-checkbox__label">Tổ {label}</span>}
        </div>
    );
};

export default AudibleCheckbox;
