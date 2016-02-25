  
    
    /**
     * GET  /plate.elements/{id} -> get the "id" session.
     * @throws URISyntaxException 
     */
    @RequestMapping(value = "/plate.elements/{id}",
        method = RequestMethod.GET,
        produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<List<Element>> getPlateElements(@PathVariable Long id, Pageable pageable) throws URISyntaxException {
        log.debug("REST request to get a page of elements");
        List<Element> p = elementsRepository.findByPlate_id(id);
        return new ResponseEntity<List<Element>>(p, HttpStatus.OK);
    }

