                    data = angular.fromJson(data);                	
                    var result = SessionPresenters.get({id: data.id})
                    data.presenters = result;    
                    
