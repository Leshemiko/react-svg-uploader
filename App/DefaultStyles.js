const DefaultStyles = {
    wrap: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '250px',
        border: '1px dotted #cecece',
        borderRadius: '5px'
    },
    uploadButton: {
        outline: 'none',
        border: 'none',
        margin: '20px auto',
        padding: '10px',
        borderRadius: '5px',
        color: '#fff',
        background: '#67a3ce',
        fontSize: '14px',
        textTransform: 'uppercase',
        boxShadow: '0px 3px 5px -3px rgba(51, 51, 51, 0.72)'
    },
    outputBox: {
        width:100,
        height:100,
        display:'flex',
        alignItems:'center',
        justifyContent:'center',
        margin: '30px 0'
   },
   themeBox: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: '75px',
        border: '1px solid',
        margin: '5px',
        padding: '5px',
        
    },
    themeColorBox: {
        width:'100%',
        height:25,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    viewBoxEditorWrap: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-start',
        height:'30px',
    },
    fileInputStyle: {display:'none'}
};

export default DefaultStyles;