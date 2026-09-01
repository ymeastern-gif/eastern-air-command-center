import assert from 'node:assert/strict';
import { deriveAsanaTaskUrl, resolveSourceLink, sourceActionLabel } from '../src/core/source-links.mjs';

assert.equal(deriveAsanaTaskUrl('1210721289397407'), 'https://app.asana.com/0/0/1210721289397407/f');
assert.equal(deriveAsanaTaskUrl('abc'), null);

assert.deepEqual(resolveSourceLink({source_system:'asana',source_ref:'1210721289397407',source_url:null}), {
  url:'https://app.asana.com/0/0/1210721289397407/f', kind:'derived_deeplink'
});
assert.deepEqual(resolveSourceLink({source_system:'gmail',source_ref:'x',source_url:'https://mail.google.com/mail/#all/abc'}), {
  url:'https://mail.google.com/mail/#all/abc', kind:'direct'
});
assert.deepEqual(resolveSourceLink({source_system:'todoist',source_ref:'123',source_url:null}), {url:null,kind:'unavailable'});
assert.equal(sourceActionLabel('asana'),'Open in Asana');
assert.equal(sourceActionLabel('gmail'),'Open Email');
console.log('source-links.test.mjs: all tests passed');
