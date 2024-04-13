import { PageActionType } from "./Reducer";

interface IProps {
    emit: (type: PageActionType, payload?: any) => void;
}




export type { IProps};
