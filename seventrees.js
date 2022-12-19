const renderParams = {
    r: 7,
    marginY: 25,
    marginX: 25
}

class TreeControl {
    constructor(parent, color) {
        this.parent = parent;
        this.color = color;
        this._tree = leaf();

        this.onTreeChange = new CustomEvent('onTreeChange');
    }

    get tree() { return this._tree; }
    set tree(newTree) {
        this._tree = newTree;
        this.render();
    }

    render() {
        if (this.transform) this.parent.removeChild(this.transform);
        this.transform = document.createElementNS("http://www.w3.org/2000/svg", "g");
        this.parent.appendChild(this.transform);

        let meas = TreeControl.measure(this.tree);

        //let dim = this.parent.getBoundingClientRect();
        this.transform.setAttribute(
            "transform",
            `translate(${renderParams.marginX/2},${meas.right + renderParams.marginX}) rotate(270)`
        );

        this.renderTree(this.tree, '', 0, 0);
        this.parent.style.width = `${meas.height + renderParams.marginY}px`;
        this.parent.style.height = `${meas.width + 2*renderParams.marginX}px`;

    }

    renderTree(tree, path, cx, cy) {
        if (tree.isLeaf) {
            this.renderNode(tree, path, cx, cy);
        }
        else {
            // measure the subtrees
            let measl = TreeControl.measure(tree.left);
            let cxl = cx - measl.right - renderParams.marginX/2;
            let cyl = cy + renderParams.marginY;
            
            let measr = TreeControl.measure(tree.right);
            let cxr = cx + measr.left + renderParams.marginX/2;
            let cyr = cy + renderParams.marginY;

            // render in the right order ... important: lines in the background
            this.renderLine(cx, cy, cxl, cyl);
            this.renderLine(cx, cy, cxr, cyr);

            // then recurse
            this.renderTree(tree.left, path + 'l', cxl, cyl);
            this.renderTree(tree.right, path + 'r', cxr, cyr);

            // then the node 
            this.renderNode(tree, path, cx, cy);
        }
    }

    renderNode(tree, path, cx, cy) {
        let circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circle.setAttribute("cx", cx.toString());
        circle.setAttribute("cy", cy.toString());
        circle.setAttribute("r", renderParams.r);
        //if (tree.color) {
            circle.style.fill = tree.color;
        //}
    
        if (tree.isLeaf) {
            circle.setAttribute("class", "leaf");
            circle.addEventListener("click", () => {
                this.tree = bud(this.tree, path, this.color);;

                this.parent.dispatchEvent(this.onTreeChange);
            });
        }
        else {
            circle.setAttribute("class", "branch");
            circle.addEventListener("click", () => {
                this.tree = prune(this.tree, path);
                this.parent.dispatchEvent(this.onTreeChange);
            });
        }
    
        this.transform.appendChild(circle);
    }

    renderLine(x1, y1, x2, y2) {
        let line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute("x1", x1.toString());
        line.setAttribute("y1", y1.toString());
        line.setAttribute("x2", x2.toString());
        line.setAttribute("y2", y2.toString());
        line.setAttribute("class", "edge");
    
        this.transform.appendChild(line);
    }

    static measure(tree) {
        if (tree.isLeaf) return { left: 0, right: 0, width: 0, height: 0 }
        
        let measLeft = TreeControl.measure(tree.left);
        let measRight = TreeControl.measure(tree.right);
        return {
            left: measLeft.width + renderParams.marginX/2,
            right: measRight.width + renderParams.marginX/2,
            width: measLeft.width + measRight.width + renderParams.marginX, 
            height: renderParams.marginY + Math.max(measLeft.height, measRight.height)
        } 
    }
    
}


