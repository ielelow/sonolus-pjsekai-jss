import chart from './append.json'
import sus from './append.txt'
import { susToUSC } from '../../../../lib/src/index'
import { uscToLevelData } from '../../../../lib/src/index'
export const data = uscToLevelData(susToUSC(sus))
