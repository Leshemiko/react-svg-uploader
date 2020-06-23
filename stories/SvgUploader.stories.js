import React from 'react';
import { action } from '@storybook/addon-actions';
import { SvgUploader } from '../App';
export default {
    title: 'SvgUploader',
    component: SvgUploader,
};
export const Default = () => <SvgUploader label="Upload"/>;

//custom examples 

const styles = {
    codeStyle : {
        padding: 15,
        margin: '15px 0',
        background : "#cfcfcf",
        border: '1px solid #adadad'
    }
}


const renderButton = (buttonAction) => {
    return (
        <button 
            id="myCustomButtonId" 
            onClick={(e) => buttonAction(e, "myInputId")}
            style={{background:'green',color:'#fff',fontSize:'16px',height:50}}
        >
            Upload svg here
        </button>
    )
};

const renderFileInput = (uploadAction) => {
    const customOnchange = (e) => {
        alert("this is a custom event handler:\nfile uploaded: " + e.target.value);
        uploadAction(e)
    };
    return (
        <input type="file" style={{display:'none'}} id="myInputId" onChange={(e) => customOnchange(e)}/>
    )
};

const renderProgress = () => {
    return null
};

const renderOutPutBox = (output, outputRef, colorEditHandler) => {
    return (
        <div id="output" 
            ref={outputRef}
            title="Click anywhere to edit colors"
            style={{width:300,height: 300, border:'2px dotted red'}}
            onClick={(e) => colorEditHandler(e)}
            dangerouslySetInnerHTML={{ __html: output}}
        />
    )
};

const renderUndoRedoButtons = (undoAction,redoAction)  => {
    return (
        <div>
            <button onClick={() => undoAction() }>Undo last change</button>
            <button onClick={() => redoAction() }>Redo last change</button>
        </div>
    )
};


const handleSubmitResult = (e,action) => {
    let res = action()
    let output = JSON.stringify(res);
    let outputCode = document.querySelector("#codeDisplay");
    if(outputCode){
        outputCode.innerHTML = output
    }
};

const renderSubmit = (action) => {
    return (
        <div>
            <button onClick={(e) => {action(e)}}>SUBMIT</button>
        </div>
    )
};

export const CustomRenderers = () => {
    return (
        <div>
            <SvgUploader 
                buttonRenderer={renderButton}
                inputRenderer={renderFileInput}
                progressRenderer={renderProgress}
                outPutBoxRender={renderOutPutBox}
                undoRedoRenderer={renderUndoRedoButtons}
                submitRenderer={renderSubmit}
            />
            <div>
                <blockquote style={{margin:0}}> 
                    <pre style={styles.codeStyle}>
                        <code id="codeDisplay">
                           
                        </code>
                    </pre>  
                </blockquote>
            </div> 
        </div>
    )
} 
   ;

Default.story = {
    name: 'Default example',
}