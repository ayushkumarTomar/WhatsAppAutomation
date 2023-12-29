import { useParams } from "react-router-dom";
import AddClient from "./Adders/AddClient";
import Addcollection from "./Adders/AddCollections";
import PhoneControl from "./PhoneControl";
import AutoPrompt from "./AutoPrompt";
import GptToken from "./GptToken";
const Editor = ()=>{

    const {type} = useParams()
    console.log(type)

    if(type=="client"){
        return(
            <AddClient/>
        )
    }

    else if(type == "auto-prompt"){
        return(
            <AutoPrompt/>
        )
    }
    else if(type == "phone-control"){
        return(
            <PhoneControl/>
        )
    }
    else if(type == "gpt-token"){
        return(
            <GptToken/>
        )
    }
    return (
        <Addcollection/>
    )


}

export default Editor;