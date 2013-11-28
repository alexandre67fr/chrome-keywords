var ext_defaults = {
  phrases_num: 10,
  keywords: "professeur\nCollège\nvirginie\nLorem ipsum",
  min_chars: 20,
  inc_ponc: 1,
  inc_numbers: 0,
  upl_type: 'replace',
  ponc_kws: '!"'
};

function getSetting(i) {
  return ( typeof(localStorage[i]) != "undefined" ? localStorage[i] : ext_defaults[i] );
}
