import React, { useState, useEffect, useRef } from "react";
require('./style.css');
import DefaultStyles  from './DefaultStyles';
const SvgUploader = (props) => {

    //initializer
    let { 
            getAPI,
            submitRenderer,
            wrapStyle = DefaultStyles.wrap,
            hideProgressBar,
            outPutBoxRender, 
            undoRedoRenderer,
            progressBarId = 'progress-bar',
            inputRenderer, 
            buttonRenderer, 
            progressRenderer,
            inputStyle = DefaultStyles.fileInputStyle, 
            buttonStyle = DefaultStyles.uploadButton
        } = props;
    const outputEl = useRef(null);
    const inputEl = useRef(null);
    const [uploadedEl, setUploadedEl] = useState(null);
    const [hoverState, setHoverState] = useState(false);
    const [undoStorage, setUndoStorage] = useState([]);   
    const [redoStorage, setRedoStorage] = useState([]);   
    const [displayProgressBar, setDisplayProgressBar] = useState(false);   
   
    const viewBoxRegex = /(?<=\bviewBox=")[^"]*/igm;
    const fillRegex = /(?<=\bfill=")[^"]*/igm;

    // useEffect(() => {
    //     setAPI()
    //   }, []);    

    //handlers
    
    const setAPI = () => {
        if(!getAPI) return null;
            return getAPI({
                undo: undoLastChange,
                redo: undoLastChange
            })
    };
    
    const storeUndoChanges = (changedObject) => {
        setUndoStorage([...undoStorage, changedObject]);
    }

    const storeRedoChanges = (changedObject) => {
        setRedoStorage([...redoStorage, changedObject]);
    }

    const undoLastChange = () => {
        if(!undoStorage.length) return;
        let lastChange = undoStorage[undoStorage.length-1];
        if(!lastChange) return;
        if(lastChange.type === 'color' ){
            lastChange.element.setAttribute("fill", lastChange.prevElementValue['fill'])
        }
        setUploadedEl({
            ...uploadedEl,
            output: lastChange.element.closest('svg').outerHTML
        });
        undoStorage.pop();
        setUndoStorage(undoStorage)
        storeRedoChanges(lastChange)
    };

    const redoLastChange = () => {
        if(!redoStorage.length) return;
        let lastChange = redoStorage[redoStorage.length-1];
        if(!lastChange) return;
        if(lastChange.type === 'color' ){
            lastChange.element.setAttribute("fill", lastChange.nextElementValue['fill'])
        }
        setUploadedEl({
            ...uploadedEl,
            output: lastChange.element.closest('svg').outerHTML
        });
        redoStorage.pop()
        setRedoStorage(redoStorage)
        storeUndoChanges(lastChange);
    };

    const handleUploadButtonClick = (e, inputId) => {
        e.preventDefault();
        let inputEl = document.querySelector(`#${inputId || 'fileUploadEl'}`);
        if(inputEl) {
            inputEl.click();
        }
        return false;
    };

    const processFile = (file) => {
       
        const fr = new FileReader();
        fr.readAsText(file);
        fr.onerror = errorHandler;
        fr.onabort = () => changeStatus('Start Loading');
        fr.onloadstart =   () => changeStatus('Start Loading');
        fr.onload = ()=> {changeStatus('Loaded')};
        fr.onloadend = (e) => loaded(e);
        fr.onprogress = setProgress;
    };

    const extractFileData = (file) => {
      
       let vb = file.match(viewBoxRegex);
       let fl = file.match(fillRegex);
       let fills = [...new Set(fl)]
       setUploadedEl({
           originalFile: {
               el: file,
               viewBox: vb[0],
               fills: fills
           },
           viewBox: vb[0],
           fills: fills,
           output:  file
       });
       
    };
    
      // Updates the value of the progress bar
    const setProgress = (e) => {
        // The target is the file reader
        if(hideProgressBar) return;;
        const progressBar = document.getElementById(progressBarId);
        if(!document.getElementById(progressBarId)) return;
        const fr = e.target;
        const loadingPercentage =  100 * e.loaded / e.total;
        progressBar.value = loadingPercentage;
    };
    
    const changeStatus = (status) => {
        console.info("Current status:" ,status)
    };
    
    const loaded = (e) => {
        changeStatus('Load ended!');
        const fr = e.target
        var result = fr.result;
        extractFileData(result);
    };
    
    const errorHandler = (e) => {
        changeStatus("Error: " + e.target.error.name)
    };

    const handleFileUpload = (e, dropedFile) => {
        const file = dropedFile ? dropedFile : e.target.files[0];
        if (file) {
          if(file.type.indexOf('svg') === -1){
            changeStatus("Error: " + 'SVG files only');
            return
          }  
          processFile(file);
        }
    };

    const handleViewBoxChange = (newValue, index) => {
        let file = uploadedEl.output;
        let eb = viewBoxRegex.exec(file)
        function replaceString(oldS, newS, fullS) {
          return fullS.split(oldS).join(newS)
        }
       
        let oldVB = uploadedEl.viewBox.split(" ");
        oldVB[index] = newValue;
        let olds = eb[0];
        let newFile = replaceString(olds,oldVB.join(" "),file);
        setUploadedEl({
           ...uploadedEl,
           viewBox: oldVB.join(" "),
           output:  newFile 
        })
    };

    const handleElementClick = (el) => {
       let colorInputExists = document.getElementById('colorInput') ;
       let colorInput = document.createElement("input");
       if(colorInputExists){
        colorInputExists.remove();
       }
      
      
       let outputWidth =  outputEl && outputEl.current.clientWidth || 0;
       let elPositions = el.getClientRects()[0];
       document.body.appendChild(colorInput);
       colorInput.setAttribute('id','colorInput');
       colorInput.setAttribute('type','color');
       colorInput.style.position = 'fixed';
       colorInput.style.cssText = "visibility:hidden;opacity:0;position:fixed;z-index:999;width:0;height:0;background:none;outline:none,border:none"
       colorInput.style.top = elPositions.top + 'px';
       colorInput.style.left = elPositions.left + outputWidth + 'px';
       colorInput.addEventListener("input", watchColorPicker, false);
       colorInput.value = el.getAttribute('fill');
       setTimeout(() => {
           colorInput.click();
       },10)
       
       function watchColorPicker(event){
            let changedObject = {
                type: 'color',
                element: el,
                prevElementValue: {'fill': el.getAttribute('fill')} ,
                nextElementValue: {'fill': event.target.value } 
            }
            storeUndoChanges(changedObject);
            el.setAttribute('fill', event.target.value);
            setUploadedEl({
                ...uploadedEl,
                output: el.closest('svg').outerHTML
            });
       }
    };

    const handleDragOver = (e) => {
       e.preventDefault();
    //    setHoverState(true)
    };

    const onDrop = (e,cat) => {
        e.preventDefault();
        let file = e.dataTransfer.files[0];
        handleFileUpload(e,file)
    };

    const sendResult = () => {
        return {
            result: uploadedEl
        }
    };

    //renderers
    const renderInput = (inputId) => {
        return (
            inputRenderer 
            ? 
                inputRenderer((e) => handleFileUpload(e)) 
            :  
                <input onInput={ (e) => handleFileUpload(e) } accept=".svg" type="file" ref={inputEl} id={inputId || "fileUploadEl"} style={inputStyle}/>
        )
    };

    const renderButton = () => {
        return (
            <div>
                {
                    buttonRenderer 
                    ? 
                        buttonRenderer((e, inputId) => handleUploadButtonClick(e,inputId)) 
                    :  
                        <button 
                            id="fileSelect" 
                            onClick={ (e) => { handleUploadButtonClick(e)} }
                            style={buttonStyle}
                        >
                            {props.label}
                        </button>
                }
            </div>
        )
    };

    const renderOutputBox = () => {
        if(!uploadedEl || !uploadedEl.output) return null;
        if(outPutBoxRender) return outPutBoxRender(uploadedEl.output, outputEl, (e) => {handleElementClick(e.target)})
        return (
            <div id="output" 
                ref={outputEl}
                title="Click anywhere to edit colors"
                style={DefaultStyles.outputBox}
                onClick={(e) => handleElementClick(e.target)}
                dangerouslySetInnerHTML={{ __html: uploadedEl.output}}
            />
        )
    };

    const renderThemeColumn = () => {
        if(!uploadedEl || !uploadedEl.fills ) return null;
        return (
                <div>
                   <h4>Original color theme:</h4> 
                    <div style={{display:'flex'}}>
                        {
                            uploadedEl.fills.map((fill,idx) => {
                                return (
                                    <div key={idx} 
                                        style={DefaultStyles.themeBox}>
                                        <div style={{...DefaultStyles.themeColorBox, background: fill}}>
                                         {fill}
                                        </div>
                                    </div>
                                )
                            })
                        }
                     </div>  
                </div>  
        )
    };

    const renderViewBoxEditor = () => {
        if(!uploadedEl || !uploadedEl.viewBox) return null;
        return (
                <div>
                    <h4>View box (original value):</h4>
                        {
                        uploadedEl.viewBox.split(" ").map( (v, index) => {
                            return (
                                <div  key={index}
                                    style={DefaultStyles.viewBoxEditorWrap}  
                                >
                                    {`(${parseInt(uploadedEl.originalFile.viewBox.split(" ")[index])})`}
                                    <input 
                                        type="range" 
                                        min={index < 2 ? "-1000" : "0"} 
                                        max="1000"
                                        value={v} 
                                        onChange={ (e) => handleViewBoxChange(e.target.value, index) }
                                    />
                                    {parseInt(v)}
                                </div>
                            )
                        })
                    }
                </div>  
        )
    };

    const renderProgressBar = () => {
        
        if(progressRenderer) return progressRenderer()
        return (
            <div>
                <progress value="0" max="100" id={progressBarId}></progress>
            </div>
        )
    };

    const renderUndoRedoButtons = () => {
        if(undoRedoRenderer) return undoRedoRenderer(() => undoLastChange(), () => redoLastChange() )
        return (
            <div>
                {
                    undoStorage.length 
                    ? 
                        <button onClick={undoLastChange}>
                            Undo
                        </button> 
                    : 
                        null
                }
                {
                    redoStorage.length 
                    ? 
                        <button onClick={redoLastChange}>
                            Redo
                        </button> 
                    : 
                        null
                }
            </div>
        )
    };

    const renderOutputResult = () => {
        if(!uploadedEl) return null;
        if(submitRenderer){
            return submitRenderer(()=> {sendResult()})
        }
        return(
            <div>
                <div>
                    <button onClick={(e) => {sendResult(e)}}>OK</button>
                </div>
            </div>
        )
    };

    return (
        <div style={wrapStyle} 
            onDragOver={(e) => handleDragOver(e)} 
            onDrop={(e) => onDrop(e,"complete")}>
           { renderInput() }
           { renderButton() }
           {/* { renderProgressBar() } */}
           { renderUndoRedoButtons() }
           { renderOutputBox() }
           { renderThemeColumn() }
           { renderViewBoxEditor() }
           { renderOutputResult() }
        </div>
    )
}
export default SvgUploader;