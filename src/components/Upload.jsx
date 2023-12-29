import { useParams } from "react-router-dom";
import ImageUpload from "./Uploaders/ImageUpload";
import NumberUpload from "./Uploaders/NumberUpload";
const Upload = ()=>{

    const {type} = useParams()
    console.log(type)

    if(type=="image"){
        return(
            <ImageUpload/>
        )
    }
    return (
        <NumberUpload/>
    )


}

export default Upload;