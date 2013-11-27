var ext_defaults = {
  phrases_num: 10,
  keywords: "professeur\nCollège\nvirginie\nLorem ipsum",
  min_chars: 20,
  inc_ponc: 0,
  inc_numbers: 0
};

function getSetting(i) {
  return ( localStorage[i] ? localStorage[i] : ext_defaults[i] );
}
