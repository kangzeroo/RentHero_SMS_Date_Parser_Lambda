function parseOnCommonStreetNames(sublet){
  const p = new Promise((res, rej) => {
    keywords.common_street_shortnames.forEach((streetname, index) => {
      const regexMatch = new RegExp(`\\d+\\s(${streetname.alias})`, 'ig')
    	const parsed_addresses = sublet.description.match(regexMatch)
      if (parsed_addresses) {
        const fullStreet = parsed_addresses[0].match(/\d+/ig)[0] + ' ' + streetname.address
        sublet.address = fullStreet
        res(sublet)
      }
      if (index === keywords.common_street_shortnames.length -1) {
        parseOnCommonBuildingAliases(sublet).then((parsedSublet) => {
          res(parsedSublet)
        }).catch((err) => {
          rej(err)
        })
      }
    })
  })
  return p
}
