const str = 'cdot3';
let fixed = str.replace(/(?<![a-zA-Z\\\\])cdot([a-zA-Z])/g, '\\\\cdot $1');
['cdot'].forEach(cmd => {
  fixed = fixed.replace(new RegExp('(?<![a-zA-Z\\\\\\\\])' + cmd + '(?![a-zA-Z])', 'g'), '\\\\' + cmd);
});
console.log(fixed);
