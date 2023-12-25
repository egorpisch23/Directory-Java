$(document).ready(function () {
    $(document).on('click', '.toggle-arrow', function () {
        var arrow = $(this);
        var contentWrapper = $(this).closest('.chapter, .sub-chapter').children('.content-wrapper').first();

        if(contentWrapper.hasClass("open")) {
            contentWrapper.removeClass("open").slideUp(300, function() {
                arrow.html('&#x25B6;');
            });
        } else {
            contentWrapper.addClass("open").slideDown(300, function() {
                arrow.html('&#x25BC;');
            });
        }
    });
});

$.ajax({
    url: "http://localhost/Server/getQuery.php?type=mainChapters",
    type: "GET",
    dataType: "json",
    success: function(data) {
        renderChapters(data);
    },
    error: function(error) {
        console.error("Ошибка при получении данных:", error);
    }
});

function renderChapters(data) {
    let content = '';

    data.chapters.forEach(chapter => {
        let chapterHtml = `<div class="chapter">
            <span class="toggle-arrow">&#x25B6;</span>
            <img src="icons/folder.ico" alt="chapter-icon">
            <p>${chapter.title}</p>
            <div class="content-wrapper">`;

        chapter.sub_chapters.forEach(subChapter => {
            let hasSubSubChapters = subChapter.sub_sub_chapters && subChapter.sub_sub_chapters.length > 0;

            let subChapterHtml = `<div class="sub-chapter">`;

            if (hasSubSubChapters) {
                subChapterHtml += `<span class="toggle-arrow">&#x25B6;</span>
                <img src="icons/consfile.ico" alt="sub-chapter-icon">`;
            } else {
                subChapterHtml += `<img src="icons/file.ico" alt="sub-chapter-icon">`;
            }

            subChapterHtml += `<p>${subChapter.title}</p>
            <div class="content-wrapper">`;

            if (hasSubSubChapters) {
                subChapter.sub_sub_chapters.forEach(subSubChapter => {
                    subChapterHtml += `<div class="sub-sub-chapter">
                        <img src="icons/file.ico" alt="sub-sub-chapter-icon">
                        <p>${subSubChapter.title}</p>
                    </div>`;
                });
            }

            subChapterHtml += `</div></div>`;
            chapterHtml += subChapterHtml;
        });

        chapterHtml += `</div></div>`;
        content += chapterHtml;
    });

    document.querySelector('.catalog').innerHTML = content;
}

$(document).ready(function () {

    var searchResults = [];
    var chapterTitleReally = "";
    var xmlDoc;
    var totalResults = 0;
    var currentIndex = 1;
    var occurrences = [];
    var currentChapter = "";

    $.ajax({
        url: "http://localhost/Server/getQuery.php?type=fullXML",
        method: "GET",
        dataType: "xml",
        success: function (xml) {
            xmlDoc = xml;
        }
    });

    $(document).on('click', ".chapter, .sub-chapter, .sub-sub-chapter", function(e) {
        e.stopPropagation();

        $(".highlightFoundChapter").removeClass("highlightFoundChapter").addClass("highlightSearchedChapter");

        $(".highlight").removeClass("highlight");
        $(this).addClass("highlight");

        if (totalResults > 0 && (currentChapter !== undefined || currentChapter !== "")) {
            $(".highlight p span").addClass("highlightFoundChapter");
        }

        let chapterName = $(this).children('p').text();

        $.ajax({
            url: "http://localhost/Server/getQuery.php?type=contentChapters&title=" + encodeURIComponent(chapterName),
            type: "GET",
            dataType: "xml",
            success: function(data) {
                let chapter = $(data).find('chapter[title="' + chapterName + '"]');
                if(chapter.length) {
                    let htmlContent = chapter.find('content').text();
                    $('.text-container').html(htmlContent);
                    if (htmlContent !== undefined) {
                        currentChapter = chapterName;
                    }
                }  
                document.querySelectorAll('.text-container div pre code').forEach((block) => {
                    Prism.highlightElement(block);
                });
                if (totalResults > 0 && (currentChapter !== undefined || currentChapter !== "")) {
                    checkIndex();
                    term = $('.search-input').val();
                    waitForText(term);
                }           
            },
            error: function(error) {
                console.error("Ошибка при получении данных:", error);
            }
        });

        let path = '';
        let parentEls = $(this).parentsUntil(".catalog");

        $.each(parentEls.get().reverse(), function(_, el) {
            let text = $(el).children('p').text();
            if (text) {
                path += `<a href="#" class="path-link">${text}</a><img src="./icons/right-direction.ico" alt="separator" class="path-separator">`;
            }
        });

        path += `<a href="#" class="path-link">${chapterName}</a>`;
        $(".path-display span").html(path);
    });

    function escapeRegExp(string) {
        return string.replace(/[.*+\-?^${}()|[\]\\]/g, '\\$&');
    }    

    function searchInXml(term) {
        searchResults = [];
        term = term.toLowerCase();
        totalResults = 0;
        $(xmlDoc).find('chapter').each(function() {
            var elementXml = $(this);
            var elementTitle = elementXml.attr('title').toLowerCase().trim();
            var contentHtml = $.parseHTML(elementXml.find('content').text());
            var $content = $(contentHtml);
            var elementContent = $content.text().toLowerCase().trim();
            var chapterResults = (elementContent.match(new RegExp(escapeRegExp(term), 'g')) || []).length;
            totalResults += chapterResults;
            if (chapterResults > 0) {
                $(".catalog .chapter, .catalog .sub-chapter, .catalog .sub-sub-chapter").each(function() {
                    var element = $(this);
                    var pElement = element.find('> p');
                    if (pElement.text().toLowerCase().trim() === elementTitle) {
                        chapterTitleReally = pElement.text();
                        pElement.wrapInner('<span class="highlightSearchedChapter"></span>');
                        element.find('.content-wrapper').addClass('open').slideDown(300, function() {
                            $(this).siblings('.toggle-arrow').html('&#x25BC;');
                        });
                        element.parents('.chapter, .sub-chapter, .sub-sub-chapter').find('> .content-wrapper').not('.open').addClass('open').slideDown(300, function() {
                            $(this).siblings('.toggle-arrow').html('&#x25BC;');
                        });
                    }
                });
                searchResults.push({
                    elementXml: elementXml,
                    elementTitle: elementTitle,
                    elementTitleReally: chapterTitleReally,
                    chapterResults: chapterResults,
                    accumulatedResults: totalResults
                });
            }
        });
        updateNumeration();
    }

    function loadChapterEmptyContainer(chapterName) {
        $.ajax({
            url: "http://localhost/Server/getQuery.php?type=contentChapters&title=" + encodeURIComponent(chapterName),
            type: "GET",
            dataType: "xml",
            success: function(data) {
                let chapter = $(data).find('chapter[title="' + chapterName + '"]');
                if(chapter.length) {
                    let htmlContent = chapter.find('content').text();
                    $('.text-container').html(htmlContent);
                    removeChapterHighlightsFounded();
                    term = $('.search-input').val();
                    currentChapter = chapterName;
                    $('.catalog span').each(function() {
                        if($(this).text() === NameChapter) {
                            $(this).removeClass('highlightSearchedChapter')
                                   .addClass('highlightFoundChapter')
                                   .parent().parent().addClass('highlight');
                            objectChapter = $(this).parent().parent();
                            parentEls = objectChapter.parentsUntil(".catalog");
                            path = '';
                    
                            $.each(parentEls.get().reverse(), function(_, el) {
                                let text = $(el).children('p').text();
                                if (text) {
                                    path += `<a href="#" class="path-link">${text}</a><img src="./icons/right-direction.ico" alt="separator" class="path-separator">`;
                                }
                            });
                    
                            path += `<a href="#" class="path-link">${chapterName}</a>`;
                            $(".path-display span").html(path);

                            document.querySelectorAll('.text-container div pre code').forEach((block) => {
                                Prism.highlightElement(block);
                            });
                        }
                    });
                    waitForText(term);
                }             
            },
            error: function(error) {
                console.error("Ошибка при получении данных:", error);
            }
        });
    }
	
	function loadChapter(NameChapter) {
        $.ajax({
            url: "http://localhost/Server/getQuery.php?type=contentChapters&title=" + NameChapter,
            type: "GET",
            dataType: "xml",
            success: function(data) {
                let chapter = $(data).find('chapter[title="' + NameChapter + '"]');
                if(chapter.length) {
                    let htmlContent = chapter.find('content').text();
                    $('.text-container').html("");
                    $('.text-container').html(htmlContent);
                    removeChapterHighlightsFounded();
                    term = $('.search-input').val();
                    currentChapter = NameChapter;
                    $('.catalog span').each(function() {
                        if($(this).text() === NameChapter) {
                            $(this).removeClass('highlightSearchedChapter')
                                   .addClass('highlightFoundChapter')
                                   .parent().parent().addClass('highlight');
                            objectChapter = $(this).parent().parent();
                            parentEls = objectChapter.parentsUntil(".catalog");
                            path = '';
                           
                            $.each(parentEls.get().reverse(), function(_, el) {
                                let text = $(el).children('p').text();
                                if (text) {
                                    path += `<a href="#" class="path-link">${text}</a><img src="./icons/right-direction.ico" alt="separator" class="path-separator">`;
                                }
                            });
                           
                            path += `<a href="#" class="path-link">${NameChapter}</a>`;
                            $(".path-display span").html(path);

                            document.querySelectorAll('.text-container div pre code').forEach((block) => {
                                Prism.highlightElement(block);
                            });
                        }
                    });
                    waitForText(term);
                }             
            },
            error: function(error) {
                console.error("Ошибка при получении данных:", error);
            }
        });
	}

    function getChapterDownload(indexcur) {
        if (!$('.text-container').text().trim()) {
                for (let i = 0; i < searchResults.length; i++) {
                    addedVar = 0;
                    if (searchResults[i].chapterResults === 1) {
                        addedVar = 1;
                    }
                    if ((indexcur >= (searchResults[i].accumulatedResults - searchResults[i].chapterResults)) && (indexcur < searchResults[i].accumulatedResults + 1)) {
                        NameChapter = searchResults[i + addedVar].elementTitleReally;
                        loadChapterEmptyContainer(NameChapter);
                        return true;
                    }
                }
        } else {
            return false;
        }
    }

    function updateNumeration() {
        if (searchResults.length > 0) {
            $('.numeration').text(currentIndex + '/' + totalResults);
        } else {
            $('.numeration').text('0/0');
        }
    }
	
    function checkChapterUp(indexcur) {
        for (let i = 0; i < searchResults.length; i++) {
            if ((indexcur + 1) === (searchResults[i].accumulatedResults + 1)) {
                NameChapter = searchResults[i + 1].elementTitleReally;
                loadChapter(NameChapter);
                return true;
			}
        };
        return false;
    }

	function checkChapterDown(indexcur) {
		for (let i = 0; i < searchResults.length; i++) {
			if (indexcur === (searchResults[i].accumulatedResults - searchResults[i].chapterResults + 1)) {
				NameChapter = searchResults[i - 1].elementTitleReally;
				loadChapter(NameChapter);
                return true;
			}
		};
        return false;
	}
    
    function removeChapterHighlights() {
        $('.catalog p .highlightSearchedChapter').contents().unwrap();
        $('.catalog p .highlightFoundChapter').contents().unwrap();
    }
    
    function removeChapterHighlightsFounded() {
        $('.catalog p').parent().removeClass('highlight');
        $('.catalog span.highlightFoundChapter').removeClass('highlightFoundChapter').addClass('highlightSearchedChapter');
    }

    function hideNumerationOnStart() {
        $('.numeration').hide();
    }
    
    function highlightText(term) {
        var context = document.querySelector('.text-container');
        var instance = new Mark(context);
        instance.unmark({
            done: function() {
                instance.mark(term, {
                    className: 'highlightSearched',
                    separateWordSearch: false,
                    done: function() {
                        occurrences = $('.highlightSearched');
                        scrollToHighlight();
                        updateNumeration();
                    }
                });
            }
        });
    }        

    function sleep(milliseconds) {
        return new Promise(resolve => setTimeout(resolve, milliseconds));
    }
    
    async function waitForText(term) {
        await sleep(200);
        if ($('.text-container').text().trim()) {
            term = $('.search-input').val();
            highlightText(term)
        }
    }
    
    function removeHighlights() {
        var context = document.querySelector('.text-container');
        var instance = new Mark(context);
        instance.unmark({
            className: 'highlightSearched',
            done: function() {
                addedremoveHighlights();
            }
        });
    }
    
    function addedremoveHighlights() {
        var context = document.querySelector('.text-container');
        var instance = new Mark(context);
        instance.unmark({
            className: 'highlightFound'
        });
    }    

    function animateScroll(occurrencesIndex) {
        targetElement = $(occurrences[occurrencesIndex]);
    
        targetElement.removeClass('highlightSearched').addClass('highlightFound');
        $('.text-container').animate({
            scrollTop: targetElement.offset().top - $('.text-container').offset().top + $('.text-container').scrollTop()
        }, 0);
    }

    function scrollToHighlight() {
        $('.highlightFound').removeClass('highlightFound').addClass('highlightSearched');
		
        if (searchResults.length === 1) {
            animateScroll(currentIndex - 1);
        } else if (searchResults.length > 1) {
            for (let i = 0; i < searchResults.length; i++) {
                if ((searchResults[i].elementTitleReally === currentChapter) && (i !== 0)) {
                    SpecialIndex = currentIndex - 1 - searchResults[i - 1].accumulatedResults;
                    animateScroll(SpecialIndex);
                } else if ((searchResults[i].elementTitleReally === currentChapter) && (i === 0)) {
                    animateScroll(currentIndex - 1);
                }
            }
        }
    }

    function checkIndex() {
        for (let i = 0; i < searchResults.length; i++) {
			if (searchResults[i].elementTitleReally === currentChapter) {
                currentIndex = searchResults[i].accumulatedResults - searchResults[i].chapterResults + 1;
                updateNumeration();
			}
		};
    }

    function searchInputEvent() {
        $('.search-input').on('input', function () {
            let hiddenElement = false;
            if ($('.numeration').is(':hidden') || totalResults > 0) {
                hiddenElement = true;
            }
            var searchTerm = $(this).val();
            currentIndex = 1;
            removeChapterHighlights();
			removeHighlights();
            if (searchTerm) {
                $('.numeration').show();
                searchInXml(searchTerm);
                document.querySelectorAll('.text-container div pre code').forEach((block) => {
                    Prism.highlightElement(block);
                });
                if ($('.text-container').text().trim() && hiddenElement === true) {
                    if (currentChapter !== "" || currentChapter !== undefined) {
                        loadChapter(currentChapter);
                        checkIndex();
                    }
                } else if ($('.text-container').text().trim() && hiddenElement === false) {
                    checkIndex();
                    $('.catalog p span').each(function() {
                        if ($(this).text() === currentChapter) {
                            $(this).removeClass("highlightSearchedChapter");
                            $(this).addClass("highlightFoundChapter");
                        }
                    });
                    highlightText(searchTerm);
                }
            } else {
                $('.numeration').hide();
            }
        });
    } 

    function clickOnSearchIcon() {
        $('.search-icon').click(function() {
            indexcur = currentIndex;
            if (!totalResults && $(this).attr('alt') !== 'Delete Icon') return;
            if ($(this).attr('alt') === 'Up Icon') {
                if (currentIndex > 0 && currentIndex < totalResults) {
                    currentIndex++;
                    booleanChapter = getChapterDownload(indexcur);
                    if (booleanChapter === false) {
                        booleanhighlight = checkChapterUp(indexcur);
                        if (booleanhighlight === false) {
                            term = $('.search-input').val();
                            highlightText(term);
                        }
                    }
                } else if (currentIndex > 0 && totalResults === 1) {
                    loadChapter(searchResults[0].elementTitleReally);
                }
            } else if ($(this).attr('alt') === 'Down Icon') {
                if (currentIndex > 1 && currentIndex <= totalResults) {
                    if (currentIndex > 1) {
                        currentIndex--;
                        booleanChapter = getChapterDownload(indexcur);
                        if (booleanChapter === false) {
							booleanhighlight = checkChapterDown(indexcur);
                            if (booleanhighlight === false) {
                                term = $('.search-input').val();
                                highlightText(term);
                            }
                        }
                    }
                } else if (currentIndex > 0 && totalResults === 1) {
                    loadChapter(searchResults[0].elementTitleReally);
                }
            } else if ($(this).attr('alt') === 'Delete Icon') {
                $('.search-input').val('');
                $('.search-input').trigger('input');
                return;
            }

            $('.numeration').text((currentIndex) + '/' + totalResults);
        });
    } 

    hideNumerationOnStart();
    searchInputEvent();
    clickOnSearchIcon();
});