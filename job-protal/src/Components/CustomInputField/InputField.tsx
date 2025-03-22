import React from 'react';
// import { TextField } from '@mui/material';

type InputFieldProps = {
    name : string;
    id : string;
    label?: string;
    placeholder : string;
    className:string;
    type : string;
    errors : any;
    [key : string] :any;
}

const InputField : React.FC<InputFieldProps> = ({ name, id, label, placeholder, className, type, errors, ...props}) => {
  return (
    <div>
      <input
        id={id}
        className={className}
        type={type}
        name={name}
        placeholder={placeholder}
        {...props}
        
        />
        {console.log('the props',props)}
      {errors && errors[name] && (<p className="error-message" style={{ color: 'red', fontSize: '12px', marginTop: '4px' }}>{errors[name].message}</p>)}
    </div>
  );
};

export default InputField;