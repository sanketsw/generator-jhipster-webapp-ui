  
    
    /**
     * GET  /<%= method.restapiName %>/{id} -> get the "id" session.
     * @throws URISyntaxException 
     */
    @RequestMapping(value = "/<%= method.restapiName %>/{id}",
        method = RequestMethod.GET,
        produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<List<<%= method.targetEntity %>>> get<%= method.factory %>(@PathVariable Long id, Pageable pageable) throws URISyntaxException {
        log.debug("REST request to get a page of <%=  method.targetEntityEnumeration %>");
        List<<%= method.targetEntity %>> p = <%=  method.targetEntityEnumeration %>Repository.<%=  method.targetJPAMethod %>(id);
        return new ResponseEntity<List<<%= method.targetEntity %>>>(p, HttpStatus.OK);
    }

