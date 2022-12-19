/* A little library for manipulating trees */


function leaf(color=undefined) { return { isLeaf: true, color: color } }

function branch(l,r,color=undefined) {
    return { isLeaf: false, left: l, right: r, color: color };
}


/* Helper functions for adding and removing branches */
// a path is a list ['l','r','l'] that identifies a certain node in a tree

// replace a leaf at position `path` by branch(leaf(),leaf())
function bud(tree, path, color=undefined) {
    if (tree.isLeaf && path === '') {
        return branch(leaf(color),leaf(color), tree.color);
    }
    else if (!tree.isLeaf && path[0] === 'l') {
        return branch(bud(tree.left, path.slice(1), color), tree.right, tree.color);
    }
    else if (!tree.isLeaf && path[0] === 'r') {
        return branch(tree.left, bud(tree.right, path.slice(1), color), tree.color);
    } 
    else {
        console.log("incorrect path while budding");
    }
}

// replace a leaf at position `path` by branch(leaf(),leaf())
function prune(tree, path) {
    if (path === '') {
        return leaf(tree.color);
    }
    else if (path[0] === 'l') {
        return branch(prune(tree.left, path.slice(1)), tree.right, tree.color);
    }
    else if (path[0] === 'r') {
        return branch(tree.left, prune(tree.right, path.slice(1)), tree.color);
    } 
    else {
        console.log("incorrect path while pruning");
    }
}

/* The 'Seven trees in One' algorithm */

function split(taggedtrees, n, t, tl, tr) {
    let [tag, trees] = taggedtrees;
    if (trees.length == (n+1) && tag === t) {
        if (trees[n].isLeaf) {
            return [ tl, trees.slice(0,n) ];
        } else {
            let tree = trees[n];
            return [ tr, trees.slice(0,n).concat([tree.left, tree.right]) ]
        }
    } 
    else {
        return taggedtrees;
    }
}

function merge(taggedtrees, n, t, tl, tr) {
    let [tag, trees]= taggedtrees;
    if (trees.length == (n+2) && tag == tr) {
        let l = trees[n];
        let r = trees[n+1];
        return [ t, trees.slice(0,n).concat([ branch(l,r) ]) ];     
    } 
    else if (trees.length == n && tag == tl) {
        return [ t, trees.concat([ leaf() ]) ];
    }
    else {
        return taggedtrees;
    }
}

function makeCommand(command, n, { t=0, tl=0, tr=0 } = {}) {
    return { command: command, n: n, t:t, tl:tl, tr:tr };
}

function invertCommand(cmd) {
    return makeCommand(
        cmd.command == 'split' ? 'merge' : 'split',
        cmd.n,
        cmd);
}

function runCommand(cmd, taggedtrees) {
    return (cmd.command == 'split')
        ? split(taggedtrees, cmd.n, cmd.t, cmd.tl, cmd.tr)
        : merge(taggedtrees, cmd.n, cmd.t, cmd.tl, cmd.tr);
}

// A winning strategy for nuclear pennies
let cmdsOneToSeven = [
    makeCommand('split',0),
    makeCommand('split',1),
    makeCommand('split',2),
    makeCommand('split',3),
    makeCommand('merge',0,{t:1}),
    makeCommand('merge',1,{tl:1}),
    makeCommand('split',4),
    makeCommand('merge',2),
    makeCommand('split',5),
    makeCommand('merge',1),
    makeCommand('split',4),
    makeCommand('merge',2),
    makeCommand('split',5,{tr:1}),
    makeCommand('split',6,{t:1}),
    makeCommand('merge',3),
    makeCommand('merge',4),
    makeCommand('merge',5),
    makeCommand('merge',6)
]

let cmdsSevenToOne = cmdsOneToSeven.map(invertCommand).reverse();

function oneToSeven(tree) {
    let taggedtrees = [0,[tree]];
    for (var cmd of cmdsOneToSeven) {
        taggedtrees = runCommand(cmd, taggedtrees);
    }
    return taggedtrees[1];
}

function sevenToOne(trees) {
    let taggedtrees = [0,trees];
    for (var cmd of cmdsSevenToOne) {
        taggedtrees = runCommand(cmd, taggedtrees);
    }
    return taggedtrees[1][0];
}


let tr = branch(branch(leaf(),leaf()),leaf());
let sev = oneToSeven(tr);
let re = sevenToOne(sev);