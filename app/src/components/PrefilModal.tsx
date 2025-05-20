import React from 'react';


export interface Option {
    key: string;
    label: string;
    sourceFormId: string;
    sourceField: string;
}


interface PrefillModalProps{
    fieldName: string;
    isOpen: boolean;
    options: Option[];
    onSelect: (opt: Option) => void;
    onClose: () => void;
}


export function PrefillModal({
    fieldName,
    isOpen,
    options,
    onSelect,
    onClose,
}: PrefillModalProps){
    if (!isOpen) return null;
    return(
        <div style ={{
            position: "fixed", top: 0, left:0, right:0, bottom:0,
            background: "rgba(0,0,0)",
            display: "flex", alignItems: "center", justifyContent: "center",
            zIndex: 1000,
        }}>
            <div style={{
                background: "rgba(255,255,255)", padding: 10, borderRadius: 10, width: 200,
            }}>
            <h3>Select the data for {fieldName}</h3>
            <ul style ={{
                maxHeight: 200, overflow: "auto", padding: 5}}>

                {options.map(o => (
                    <li key={o.key} style={{margin: "5px 0"}}>
                        <button>
                            {o.label}
                        </button>
                    </li>
                ))}

            </ul>
        </div>
    </div>
        
    )
}