import assert from 'node:assert/strict';
import {parseFloor,buildAsanaProductionRows,productionSummary,productionMatrix,cellState} from '../src/core/project-structure.mjs';
assert.equal(parseFloor('Tx-3 #1 2nd floor'),'2F');
assert.equal(parseFloor('Piping Shops 14th Floor'),'14F');
assert.equal(parseFloor('Cellar piping'),'Cellar');
assert.equal(parseFloor('Roof penetrations'),'Roof');
const sources=[
 {id:'1',project_id:'p',source_system:'asana',title:'2nd floor',raw:{section:'Shops Piping',assignee:'Dan'}},
 {id:'2',project_id:'p',source_system:'asana',title:'2nd floor revision',raw:{section:'Sheetmetal Shops',assignee:'Ilya',completed_at:'2026-08-01'}},
 {id:'3',project_id:'p',source_system:'asana',title:'3rd floor',raw:{section:'Shops Piping',assignee:'Dan'}},
];
const rules=[
 {project_id:'p',source_system:'asana',match_field:'section',match_value:'Shops Piping',work_type:'piping_shop',active:true,sort_order:1},
 {project_id:'p',source_system:'asana',match_field:'section',match_value:'Sheetmetal Shops',work_type:'sheetmetal_shop',active:true,sort_order:2},
];
const rows=buildAsanaProductionRows(sources,'p',rules);assert.equal(rows.length,3);assert.equal(rows[0].workType,'piping_shop');
const summary=productionSummary(rows);assert.equal(summary.assignees.find(x=>x.assignee==='Dan').active,2);
const matrix=productionMatrix(rows,['piping_shop','sheetmetal_shop']);assert.deepEqual(matrix.floors,['2F','3F']);assert.equal(cellState(matrix.cells.get('2F|piping_shop')),'active');assert.equal(cellState(matrix.cells.get('2F|sheetmetal_shop')),'complete');assert.equal(cellState(matrix.cells.get('3F|sheetmetal_shop')),'empty');
console.log('project-structure.test.mjs: all tests passed');
